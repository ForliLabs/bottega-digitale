export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";

export default async function QueuePage() {
  const business = await getBusinessContext();

  const entries = business
    ? await prisma.queueEntry.findMany({
        where: { businessId: business.id, status: { in: ["waiting", "called", "serving"] } },
        orderBy: { position: "asc" },
      })
    : [];

  const todayCompleted = business
    ? await prisma.queueEntry.count({
        where: {
          businessId: business.id,
          status: "completed",
          completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      })
    : 0;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Gestione coda
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Coda walk-in</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Gestisci la coda dei clienti senza appuntamento. I clienti scansionano un QR code per mettersi in
          fila e ricevono una notifica WhatsApp quando tocca a loro.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">In coda ora</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {entries.filter((e) => e.status === "waiting").length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">In servizio</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {entries.filter((e) => e.status === "serving").length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Serviti oggi</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{todayCompleted}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Attesa stimata</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {entries.filter((e) => e.status === "waiting").length * (business?.avgServiceMinutes || 30)} min
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Coda attuale</h2>
          </div>
          {entries.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {entries.map((entry, i) => (
                <div key={entry.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        entry.status === "serving"
                          ? "bg-emerald-100 text-emerald-700"
                          : entry.status === "called"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{entry.customerName}</p>
                      <p className="text-xs text-slate-500">
                        {entry.customerPhone || "Telefono non fornito"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      entry.status === "serving"
                        ? "bg-emerald-100 text-emerald-700"
                        : entry.status === "called"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {entry.status === "serving"
                      ? "In servizio"
                      : entry.status === "called"
                        ? "Chiamato"
                        : "In attesa"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Nessuno in coda. I clienti possono unirsi scansionando il QR code.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">📱 QR Code</h2>
            <p className="mt-2 text-sm text-slate-600">
              Stampa e posiziona questo QR code all&apos;ingresso della tua attività. I clienti possono
              scansionarlo per mettersi in coda automaticamente.
            </p>
            <div className="mt-4 flex h-48 items-center justify-center rounded-2xl bg-slate-50">
              <div className="text-center">
                <span className="text-6xl">📱</span>
                <p className="mt-2 text-sm font-medium text-slate-600">QR Code</p>
                <p className="text-xs text-slate-400">
                  {business ? `/queue/${business.id}` : "/queue/demo"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h3 className="font-semibold text-amber-800">Come funziona</h3>
            <ol className="mt-3 space-y-2 text-sm text-amber-700">
              <li>1. Il cliente scansiona il QR code</li>
              <li>2. Inserisce nome e telefono (opzionale)</li>
              <li>3. Riceve posizione e tempo di attesa stimato</li>
              <li>4. Notifica WhatsApp quando tocca a lui</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

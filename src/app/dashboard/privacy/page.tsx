export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { generatePrivacyPolicy, DEFAULT_CONSENT, COOKIE_CATEGORIES } from "@/lib/gdpr";
import { prisma } from "@/lib/prisma";

export default async function PrivacyPage() {
  const business = await getBusinessContext();

  const auditLogs = business
    ? await prisma.auditLog.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  const consentCount = business
    ? await prisma.customerConsent.count({
        where: { businessId: business.id },
      })
    : 0;

  const privacyPolicy = business
    ? generatePrivacyPolicy({
        businessName: business.name,
        address: business.address,
        email: business.email,
        phone: business.phone,
        city: business.city,
      })
    : null;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">
          Conformità GDPR
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Privacy & Protezione Dati
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Gestisci la conformità GDPR: esportazione dati, diritto all&apos;oblio, consensi,
          audit log e informativa privacy.
        </p>
      </section>

      {/* GDPR Actions */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-2xl">📦</p>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">Esporta dati cliente</h3>
          <p className="mt-1 text-xs text-slate-500">
            Art. 20 — Esporta tutti i dati di un cliente in formato JSON o CSV.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            <code className="rounded bg-slate-100 px-1 font-mono">GET /api/gdpr?action=export&amp;customerId=...</code>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-2xl">🗑️</p>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">Cancella dati cliente</h3>
          <p className="mt-1 text-xs text-slate-500">
            Art. 17 — Cancella tutti i dati personali con anonimizzazione delle prenotazioni.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            <code className="rounded bg-slate-100 px-1 font-mono">DELETE /api/gdpr</code>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-2xl">✅</p>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">Consensi raccolti</h3>
          <p className="mt-1 text-xs text-slate-500">
            {consentCount} consensi registrati con preferenze granulari.
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{consentCount}</p>
        </div>
      </section>

      {/* Consent Categories */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Categorie di consenso</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(DEFAULT_CONSENT).map(([key, defaultValue]) => (
            <div key={key} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
              <div>
                <p className="text-xs font-medium text-slate-700">{key.replace(/([A-Z])/g, " $1").trim()}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                defaultValue ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
              }`}>
                Default: {defaultValue ? "Attivo" : "Disattivo"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Cookie Categories */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Cookie banner del sito</h3>
        <div className="space-y-2">
          {COOKIE_CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
              <div>
                <p className="text-xs font-semibold text-slate-900">{cat.name}</p>
                <p className="text-[10px] text-slate-500">{cat.description}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                cat.required ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
              }`}>
                {cat.required ? "Obbligatorio" : "Opzionale"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Audit Log */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Registro audit (Art. 30)</h3>
          <span className="text-xs text-slate-400">{auditLogs.length} voci recenti</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-2xl">📋</p>
            <h4 className="mt-3 text-sm font-semibold text-slate-900">Nessuna voce nel registro</h4>
            <p className="mt-1 text-xs text-slate-500">
              Le azioni di accesso, esportazione e cancellazione dati verranno registrate qui.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Azione</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Risorsa</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Attore</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-3 py-2 font-medium text-slate-900">{log.action}</td>
                    <td className="px-3 py-2 text-slate-600">{log.resource}</td>
                    <td className="px-3 py-2 text-slate-600">{log.actorType}</td>
                    <td className="px-3 py-2 text-slate-400">
                      {new Date(log.createdAt).toLocaleDateString("it-IT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Privacy Policy Preview */}
      {privacyPolicy && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Informativa privacy generata</h3>
          <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-6">
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
              {privacyPolicy}
            </pre>
          </div>
        </section>
      )}
    </div>
  );
}

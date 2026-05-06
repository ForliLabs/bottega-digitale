// Developer Documentation Portal
import { generateOpenAPISpec, WEBHOOK_EVENTS } from "@/lib/webhook-api";

export default function DevelopersPage() {
  const spec = generateOpenAPISpec();
  const info = spec.info as { title: string; version: string; description: string };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">{info.title}</h1>
          <p className="mt-4 text-lg text-slate-600">{info.description}</p>
          <p className="mt-2 text-sm text-slate-400">Versione {info.version}</p>
        </header>

        <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Primo passo</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Apri l&apos;explorer API</h2>
          <p className="mt-2 text-sm text-slate-600">Filtra endpoint, scarica la specifica OpenAPI e verifica quali route sono pubbliche.</p>
          <a href="/developers/api" className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Apri explorer API
          </a>
        </section>

        <section className="mt-16 space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-bold text-slate-900">Autenticazione</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tutte le richieste API richiedono un header <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">Authorization</code>.
            </p>
            <div className="mt-4 rounded-lg bg-slate-900 p-4">
              <code className="text-sm text-green-400">
                curl -H &quot;Authorization: Bearer sk_live_...&quot; \<br />
                &nbsp;&nbsp;https://api.bottegadigitale.it/v1/bookings
              </code>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-bold text-slate-900">Rate Limiting</h2>
            <p className="mt-2 text-sm text-slate-600">
              Default: 1.000 richieste/ora per chiave API. Header di risposta:
            </p>
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              <li><code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">X-RateLimit-Limit</code> — Limite massimo</li>
              <li><code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">X-RateLimit-Remaining</code> — Richieste rimanenti</li>
              <li><code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">X-RateLimit-Reset</code> — Timestamp reset</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-bold text-slate-900">Webhook Events</h2>
            <p className="mt-2 text-sm text-slate-600">
              Registra un endpoint per ricevere notifiche in tempo reale. I payload sono firmati con HMAC-SHA256.
            </p>
            <div className="mt-4 space-y-2">
              {WEBHOOK_EVENTS.map((event) => (
                <div key={event.type} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <code className="font-mono text-sm text-indigo-600">{event.type}</code>
                  <span className="text-sm text-slate-500">{event.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-bold text-slate-900">Verifica Signature</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ogni webhook include un header <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">X-Webhook-Signature</code>.
              Verifica con HMAC-SHA256:
            </p>
            <div className="mt-4 rounded-lg bg-slate-900 p-4">
              <code className="text-xs text-green-400">
                {`const crypto = require('crypto');`}<br />
                {`const signature = crypto`}<br />
                {`  .createHmac('sha256', webhookSecret)`}<br />
                {`  .update(requestBody)`}<br />
                {`  .digest('hex');`}<br />
                {`const valid = signature === req.headers['x-webhook-signature'];`}
              </code>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-bold text-slate-900">OpenAPI Spec</h2>
            <p className="mt-2 text-sm text-slate-600">
              La specifica OpenAPI completa è disponibile a:
            </p>
            <div className="mt-4 rounded-lg bg-slate-100 p-3">
              <code className="font-mono text-sm text-slate-700">GET /api/openapi</code>
            </div>
          </div>
        </section>

        <footer className="mt-16 text-center text-sm text-slate-400">
          <p>Bottega Digitale — API Aperta v{info.version}</p>
        </footer>
      </div>
    </div>
  );
}

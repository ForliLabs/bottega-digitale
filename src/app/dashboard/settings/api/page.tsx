export const dynamic = "force-dynamic";
import Link from "next/link";
import { requireBusinessContext } from "@/lib/auth";
import { listApiKeys, WEBHOOK_EVENTS } from "@/lib/webhook-api";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/feedback";
import { ApiSettingsClient } from "./api-settings-client";

export default async function ApiSettingsPage() {
  const business = await requireBusinessContext();

  if (!business) {
    return (
      <EmptyState
        icon="🔐"
        title="Accedi per gestire API e webhook"
        description="Per creare chiavi API, copiare secret e registrare webhook serve una sessione proprietario attiva."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/login" className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Accedi
            </Link>
            <Link href="/developers/api" className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Apri documentazione
            </Link>
          </div>
        }
      />
    );
  }

  const apiKeys = await listApiKeys(business.id);
  const webhookEndpoints = await prisma.webhookEndpoint.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-700">API Aperta</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">API & Webhook</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Genera chiavi, registra endpoint e copia i secret senza uscire dalla dashboard.
          Documentazione completa su <code className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-xs">/api/openapi</code>.
        </p>
      </section>

      <ApiSettingsClient
        initialApiKeys={apiKeys}
        initialWebhookEndpoints={webhookEndpoints}
        availableEvents={WEBHOOK_EVENTS}
      />

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
